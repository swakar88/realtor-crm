import { redirect } from 'next/navigation';

export default function Home() {
    // This sends the user straight to the login screen
    redirect('/login');
}