import NextAuth from 'next-auth';
// User type is available from authServices types
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { authServices } from '@services/auth/services';

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
				url: process.env.AUTH_KV_REST_API_URL,
				token: process.env.AUTH_KV_REST_API_TOKEN,
				env: false
			})
		: memoryDriver()
});

export const providers: Provider[] = [
	Credentials({
		async authorize(credentials) {
			try {
				/**
				 * Sign in with Bookly backend
				 */
				if (credentials?.formType === 'signin') {
					const loginResponse = await authServices.login({
						email: credentials.email as string,
						password: credentials.password as string
					});

					if (loginResponse.success && loginResponse.data) {
						const user = loginResponse.data.user;
						return {
							id: user.id,
							email: user.email,
							name: user.fullName || `${user.firstName} ${user.lastName}`,
							image: user.avatar,
							accessToken: loginResponse.data.access_token,
							permissions: loginResponse.data.user.permissions,
							roles: loginResponse.data.user.roles
						};
					}
				}

				/**
				 * Sign up with Bookly backend
				 */
				if (credentials?.formType === 'signup') {
					const registerResponse = await authServices.register({
						email: credentials.email as string,
						password: credentials.password as string,
						firstName: (credentials.firstName as string) || (credentials.email as string).split('@')[0],
						lastName: (credentials.lastName as string) || 'Usuario',
						acceptTerms: true
					});

					if (registerResponse.success && registerResponse.data) {
						// After successful registration, attempt to login
						const loginResponse = await authServices.login({
							email: credentials.email as string,
							password: credentials.password as string
						});

						if (loginResponse.success && loginResponse.data) {
							return {
								id: loginResponse.data.user.id,
								email: loginResponse.data.user.email,
								name:
									loginResponse.data.user.fullName ||
									`${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`,
								image: loginResponse.data.user.avatar,
								accessToken: loginResponse.data.token
							};
						}
					}
				}

				return null;
			} catch (error) {
				console.error('Auth error:', error);
				return null;
			}
		}
	}),
	Google,
	Facebook
];

const config = {
	theme: { logo: '/assets/images/logo/logo.svg' },
	adapter: UnstorageAdapter(storage),
	pages: {
		signIn: '/sign-in'
	},
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			/** Checkout information to how to use middleware for authorization
			 * https://next-auth.js.org/configuration/nextjs#middleware
			 */
			return true;
		},
		jwt({ token, trigger, account, user }) {
			if (trigger === 'update') {
				token.name = user.name;
			}

			if (account?.provider === 'credentials' && user && 'accessToken' in user) {
				return { ...token, accessToken: (user as { accessToken: string }).accessToken };
			}

			if (account?.provider === 'keycloak') {
				return { ...token, accessToken: account.access_token };
			}

			return token;
		},
		async session({ session, token }) {
			if (token.accessToken && typeof token.accessToken === 'string') {
				session.accessToken = token.accessToken;
			}

			if (session) {
				try {
					/**
					 * Get the session user profile from Bookly backend
					 */
					const profileResponse = await authServices.getProfile();

					if (profileResponse.success && profileResponse.data) {
						session.db = profileResponse.data;
						return session;
					}
				} catch (error) {
					console.error('Error fetching user profile:', error);
					// Return session without db data if profile fetch fails
					return session;
				}
			}

			return session;
		}
	},
	experimental: {
		enableWebAuthn: true
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig;

export type AuthJsProvider = {
	id: string;
	name: string;
	style?: {
		text?: string;
		bg?: string;
	};
};

export const authJsProviderMap: AuthJsProvider[] = providers
	.map((provider) => {
		const providerData = typeof provider === 'function' ? provider() : provider;

		return {
			id: providerData.id,
			name: providerData.name,
			style: {
				text: (providerData as { style?: { text: string } }).style?.text,
				bg: (providerData as { style?: { bg: string } }).style?.bg
			}
		};
	})
	.filter((provider) => provider.id !== 'credentials');

export const { handlers, auth, signIn, signOut } = NextAuth(config);
