
import Add from "../components/layers/AddMoreSections/addMore.tsx";
import MySite from "../components/layers/MySite/Mysite.tsx";

const Dashboard = () => {


    return (
        <>
            <div className="flex flex-wrap">
            <div className="w-1/2 flex flex-col items-center">
            {/*My site*/}
            <MySite/>

            <Add/>
            </div>
                <div className="w-1/2">
                {/*My site*/}
                    <h3 className="text-gray-300 text-sm font-medium mb-4">My Site</h3>


                    {/*Add more sections*/}
                    <Add/>
                </div>
            </div>
        </>
    );
}

export default Dashboard;