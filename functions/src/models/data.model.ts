export interface gralWriteData {
  id?: string,
  success: boolean,
  message?: string,
  path?: string,
}

export interface gralReadData {
  id: string,
  path: string,
  exists: boolean,
  success?: boolean,
}
