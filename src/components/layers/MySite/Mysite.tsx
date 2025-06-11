import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";

const MySite = () => {
    return (
        <div className="w-full">
            <h3 className="text-gray-300 text-sm font-medium mb-4">My Site</h3>
            <div className="space-y-3">
                <Profile />
                <Social />
            </div>
        </div>
    );
}

export default MySite;