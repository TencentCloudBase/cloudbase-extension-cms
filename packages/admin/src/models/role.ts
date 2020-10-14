interface RoleState {
  roleAction: 'create' | 'edit'
  selectedRole: any
}

const state: RoleState = {
  roleAction: 'create',
  selectedRole: {},
}

export default {
  state,
  reducer: {},
}
