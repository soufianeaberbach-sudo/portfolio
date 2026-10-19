/** Await the actual decoded representation, never an arbitrary animation delay. */
export async function photoReady(reader,view){
 const panel=reader.locator(`[data-photo-view="${view}"]`);
 await panel.waitFor({state:'visible',timeout:5000});
 await panel.locator('img').evaluate(image=>image.decode());
}
