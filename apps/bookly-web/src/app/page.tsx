import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/sign-in`);
	return null;
}

export default MainPage;
