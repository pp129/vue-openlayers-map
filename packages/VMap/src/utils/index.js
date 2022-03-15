
export const uuid = () => {
  const tempUrl = URL.createObjectURL(new Blob())
  const uuid = tempUrl.toString() // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(tempUrl)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}
