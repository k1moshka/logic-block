
// @flow
type Context = {}


type Scheme = { [x:string]: FieldReducer | Scheme }
type Content<T> = T


type FieldReducer = () => Render


// render является атомом в конфигурации, который преобразует переданное значение в выходное
type Render 			= (newValue: any, oldValue: any, 
							path?: string) 							=> any
type Renderer 			= (transformFn: (fieldValue: any) => any) 	=> Render

type FieldReducer 		= (reducer: Reducer) 						=> Renderer(createReducerRenderer(reducer))
type SchemeReducer		= (scheme: Scheme) 							=> Renderer(createDataBlockRenderer(scheme))





type DataBlock = (scheme: Scheme, initialValue: Content) => SchemeReducer(scheme)

const StaticValueRender = (value) => () => value
const ReducerRenderer = (reducer) => (newValue, oldValue, path) => reducer(getPath(newValue, path), path, newValue, oldValue) 
const SchemeRenderer = (scheme, state) => {
	const builtScheme = scheme.reduce((fld) => {
		if (isStaticType(fld)) 		return StaticValueRender(fld)
		if (isBlock(fld)) 			return fld(undefined, state)

		return fld
	})

	return (newValue = {}, oldValue, path) => {
		const value = merge({}, oldValue, newValue)
		const result = {}
		for (newFld in scheme) {
			setPath(result, path, schemeEntry(newFld, oldFld, path))
		}

		return result
	}
}

const createState = () => {
	return {}
}

const DataBlock = (scheme, initialValue, state = createState()) => {
	let value
	const render = SchemeRenderer(scheme, state)
	
	return (newValue = initialValue, oldValue = {}, path = undefined) => {
		const result = render(
			newValue, 
			oldValue || value, 
			path
		) 
		value = result
		return result
	}
}

const value = (defaultValue) => ReducerRenderer((value = defaultValue) => value)
const fields = (fn, deps) => ReducerRenderer((fieldValue, value, oldValue, path) => fn(...deps.map(d => getPath(value, d)), fieldValue))
const EmailBlock = DataBlock({
	id: value(1),
	email: value(''),
	isValidAddress: fields((email) => checkEmailAddress(email), ['email'])
})

const FormBlock = DataBlock({
	email: EmailBlock
})

const buildScheme = (scheme: Object) => {
	const scheme = getFields(scheme).reduce((acc, path) => {
		const value = getPath(scheme, path)
		setPath(acc, path, value)

		return acc
	})

	return scheme
}




block() // { a: 1, s: 2 }
block({ a: 100 }) // { a: 100, s: 101 }




