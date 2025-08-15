import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";
import V_Card from "./V-Card/V-Card.tsx";

const MySite = () => {
    return (
        <div className="w-full mt-60  ">
            <h3 className="text-lg font-bold text-gray-800 mb-5 uppercase tracking-wide text-start">My VeSite</h3>
            <div className="space-y-3">
                <Profile />
                <Social />
                <V_Card/>
            </div>
        </div>
    );
};
export default MySite;
