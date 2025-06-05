package pkg

type Schema string

const (
	SchemaAmericanExpress Schema = "American Express"
	SchemaJCB             Schema = "JCB"
	SchemaMaestro         Schema = "Maestro"
	SchemaVisa            Schema = "Visa"
	SchemaMasterCard      Schema = "MasterCard"
	SchemaUnknown         Schema = "Unknown"
)
