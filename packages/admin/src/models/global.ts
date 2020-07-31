export default {
    state: {
        gAddr: {},
        packages: []
    },
    init: () => {
        console.log('init')
        return {
            gAddr: { no: 22, comment: '33', recordTime: 2222, isValid: true },
            packages: [2, 3, 46]
        }
    }
}
