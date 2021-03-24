interface AppState {
  appAction: 'create' | 'edit'
  selectedApp: any
}

const state: AppState = {
  appAction: 'create',
  selectedApp: {},
}

export default {
  state,
  reducer: {},
}
