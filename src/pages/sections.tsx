import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";

const Sections = () => {
    return (
        <div className="flex flex-wrap justify-center w-full p-4 2xl:max-w-[350px] mt-20">
            <div>
                <MySite />
                <Add />
            </div>
        </div>
    );
};

export default Sections;