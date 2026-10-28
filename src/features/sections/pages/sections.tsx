import Add from "../components/addMore";
import MySite from "../../biosite/components/Mysite";

const Sections = () => {
  return (
    <div className="flex max-w-[420px] flex-wrap gap-y-5 justify-center w-full h-full transform scale-[0.85]">
      <MySite />
      <Add />
    </div>
  );
};

export default Sections;
