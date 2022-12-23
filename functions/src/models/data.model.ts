export interface gralWriteData {
  success: boolean,
  message?: string,
  path?: string,
}

export interface gralReadData {
  id: string,
  exists: boolean,
  success?: boolean,
}
