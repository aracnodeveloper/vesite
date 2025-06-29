import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";

const MySite = () => {
    return (
        <div className="w-full mt-12  ">
            <h3 className="text-black text-2xl font-medium mb-8">My Site</h3>
            <div className="space-y-3">
                <Profile />
                <Social />
            </div>
        </div>
    );
};
export default MySite;
