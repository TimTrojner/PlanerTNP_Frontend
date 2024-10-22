import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import '../App.css';
import './navbar.css';

function Calendar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            setSignedIn(Cookie.get("signed_in_user"));
        } else {
            setSignedIn(false);
        }
    }, []);

    return (
        <div>
            
        </div>
    );
}

export default Calendar;