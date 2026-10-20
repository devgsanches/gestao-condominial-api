type Session = {
	result: {
		access_token: string
	}
}

// biome-ignore lint/complexity/noStaticOnlyClass: mapper utilitário com métodos estáticos
export class AuthenticatePresenter {
	static toHTTP(session: Session) {
		return {
			access_token: session.result.access_token,
		}
	}
}
