
import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";

const Sections = () => {


    return (
        <div className="flex flex-wrap">
            {/* Panel de edición */}
            <div className=" p-4">
                <MySite />
                <Add />
            </div>


        </div>
    );
};

export default Sections;
