// 학급 프로필 이미지(profileImgStorage: { [urlId]: { url, price } })를 교사가 정한 순서대로 나열한다.
// profileImgStorage는 순서가 없는 사전이라, 순서는 class_data.profileImgOrder(urlId 배열)에 따로 저장한다.
// 순서 목록에 없는 이미지(새로 등록한 것 등)는 원래 순서대로 맨 뒤에 붙는다.
export function orderedProfileImgIds(storage, order) {
  const ids = Object.keys(storage ?? {});
  const known = new Set(ids);
  const head = (Array.isArray(order) ? order : []).filter((id, i, arr) => known.has(id) && arr.indexOf(id) === i);
  const headSet = new Set(head);
  return [...head, ...ids.filter((id) => !headSet.has(id))];
}
