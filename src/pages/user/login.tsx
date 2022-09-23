import { useCookies } from "react-cookie";

const Home = () => {
    const [cookies, setCookies, removeCookie] = useCookies();

    // Prints cookie stored from index.tsx
    // {user: {id: '1', name: 'John Doe'}}
 return(<a href="/api/auth/login">Login</a>);
};

export default Home;
