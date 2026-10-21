export abstract class HashGenerator {
	abstract hash(plain: string, saltOrRounds: number): Promise<string>
}
