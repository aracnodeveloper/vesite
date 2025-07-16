import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";

const Sections = () => {
    return (
        <div className="flex flex-wrap justify-center w-full p-4 mt-4">
            <div className="max-w-2xl transform scale-[0.9] origin-top">
                <MySite />
                <Add />
            </div>
        </div>
    );
};

export default Sections;
