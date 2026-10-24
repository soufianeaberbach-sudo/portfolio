"""Foreground-aware studio compositing; source RGB is immutable inside the trimap core.

No generative retouching, colour threshold over garments, geometric warp or CSS trick.
The segmentation is used only to construct a trimap. Closed-form matting estimates
the narrow uncertain silhouette, then the original photographic pixels are placed
over exact white with a local, source-derived sole shadow.
"""
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
from pymatting import estimate_alpha_cf


def composite(source: Image.Image, segmentation: Image.Image):
    rgb = np.asarray(source.convert('RGB'), dtype=np.uint8)
    probability = np.asarray(segmentation.convert('L'), dtype=np.float64) / 255
    assert rgb.shape[:2] == probability.shape
    body = probability > .5
    assert .08 < body.mean() < .65, 'implausible subject coverage'
    core = ndi.binary_erosion(probability > .97, iterations=2)
    # Background certainty comes from semantic exclusion, never white brightness.
    outside = ~ndi.binary_dilation(probability > .02, iterations=2)
    trimap = np.full(body.shape, .5)
    trimap[outside] = 0
    trimap[core] = 1
    alpha = estimate_alpha_cf(rgb.astype(np.float64) / 255, trimap,
                              laplacian_kwargs={'epsilon': 1e-7},
                              cg_kwargs={'maxiter': 2000})
    alpha[core] = 1
    alpha[outside] = 0
    # Persist the actual quantized matte used in the compositing operation.
    alpha8 = np.round(np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    alpha = alpha8.astype(np.float64) / 255
    shadow = source_shadow(rgb, body)
    ground = 255 - shadow.astype(np.float64)
    # Estimate the original local ground at silhouette edges. This avoids
    # premultiplying the photographed hair/cloth edge a second time.
    background = (alpha == 0).astype(np.float64)
    denominator = ndi.gaussian_filter(background, 10)
    original_ground = np.empty(rgb.shape, dtype=np.float64)
    for channel in range(3):
        numerator = ndi.gaussian_filter(rgb[:, :, channel] * background, 10)
        original_ground[:, :, channel] = np.divide(numerator, denominator,
            out=np.full(body.shape, 255.0), where=denominator > 1e-7)
    a = alpha[:, :, None]
    foreground = np.divide(rgb - (1-a)*original_ground, a,
        out=np.zeros_like(original_ground), where=a > 0)
    result = np.round(a*np.clip(foreground, 0, 255) + (1-a)*ground[:, :, None]).astype(np.uint8)
    result[core] = rgb[core]
    exposed = (alpha8 == 0) & (shadow == 0)
    assert np.all(result[exposed] == 255), 'non-white exposed background'
    assert np.array_equal(result[core], rgb[core]), 'foreground core changed'
    ys, xs = np.where(body)
    holes, n = ndi.label(ndi.binary_fill_holes(body) & ~body)
    hole_sizes = np.bincount(holes.ravel())[1:]
    metrics = {
        'foregroundBounds': [int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)],
        'foregroundFraction': round(float(body.mean()), 6),
        'preservedCorePixels': int(core.sum()),
        'preservedLightCorePixels': int((core & (rgb.min(axis=2) > 200)).sum()),
        'coreMaxRGBDifference': int(np.abs(result[core].astype(int)-rgb[core]).max()),
        'exposedBackgroundPixels': int(exposed.sum()),
        'nonWhiteExposedBackgroundPixels': int(np.any(result[exposed] != 255, axis=1).sum()),
        'partialMattePixels': int(((alpha8 > 0) & (alpha8 < 255)).sum()),
        'enclosedGapAreas': sorted([int(x) for x in hole_sizes if x >= 8], reverse=True),
        'shadowPixels': int((shadow > 0).sum()), 'shadowMaxDarkness': int(shadow.max()),
        'shadowFraction': round(float((shadow > 0).mean()), 6),
    }
    return Image.fromarray(result), Image.fromarray(alpha8), Image.fromarray((trimap*255).astype(np.uint8)), Image.fromarray(shadow), metrics


def source_shadow(rgb, body):
    """Keep local photographed sole darkening, with the broad studio floor removed."""
    h, w = body.shape
    yy, xx = np.mgrid[:h, :w]
    sole = np.where(body)[0].max()
    feet, count = ndi.label(body & (yy >= sole-55))
    window = np.zeros(body.shape, dtype=np.float64)
    for component in range(1, count+1):
        fy, fx = np.where(feet == component)
        if len(fx) < 25:
            continue
        bottom = fy.max()
        cx = (fx.min()+fx.max())/2
        rx = (fx.max()-fx.min())/2+34
        xdist = np.abs(xx-cx)/rx
        ydist = (yy-bottom)/15
        local = np.exp(-xdist**4-ydist**2)
        local[(xdist >= 1.6) | (yy < bottom-25) | (yy > bottom+32)] = 0
        window = np.maximum(window, local)
    grey = rgb.astype(np.float64).mean(axis=2)
    # Closing estimates the local illuminated floor only within this foot mask.
    # It is never used to classify, recolour or threshold the garments.
    floor = ndi.grey_closing(grey, size=(71, 151))
    darkening = ndi.gaussian_filter(np.maximum(floor-grey-.8, 0), .7)
    shadow = np.round(np.minimum(darkening, 24)*window).astype(np.uint8)
    shadow[window < .015] = 0
    return shadow
