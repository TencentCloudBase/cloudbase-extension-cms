declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    TCB_ENVID: string
    SECRETID: string
    SECRETKEY: string
  }
}
