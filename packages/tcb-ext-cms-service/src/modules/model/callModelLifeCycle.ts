let firstUpperCase = ([first, ...rest]) => first.toUpperCase() + rest.join('')

// eslint-disable-next-line
export default async function (stage, modelParams, payload?) {
  const { resource, operate } = modelParams
  try {
    // eslint-disable-next-line
    let model = require(`./resources/${resource}`)
    let lifeCycleFunctionName = `${stage}${firstUpperCase(operate)}`

    let modelLifeCycleFunction = model[lifeCycleFunctionName]

    return modelLifeCycleFunction(modelParams, payload)
  } catch (e) {}
}
