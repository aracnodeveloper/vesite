import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";
import V_Card from "./V-Card/V-Card.tsx";

const MySite = () => {
    return (
        <div className="w-full mt-60  ">
            <h3 className="text-gray-600  text-2xl font-medium mb-8">My VeSite</h3>
            <div className="space-y-3">
                <Profile />
                <Social />
                <V_Card/>
            </div>
        </div>
    );
};
export default MySite;
