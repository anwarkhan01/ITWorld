import {useEffect} from "react";
import {IoWarningOutline} from "react-icons/io5";
import {IoIosInformationCircleOutline} from "react-icons/io";
import {GrStatusGood} from "react-icons/gr";
const Toast = ({
  message = " A demo message",
  type = "information",
  duration = 3000,
  onclose,
}) => {
  const borderColors = {
    success: "border-green-500",
    failure: "border-red-500",
    information: "border-blue-500",
    warning: "border-yellow-500",
  };

  const icons = {
    success: (
      <GrStatusGood className="inline text-green-400 text-[30px] md:text-[20px]" />
    ),
    failure: (
      <IoWarningOutline className="inline text-red-400 text-[30px] md:text-[20px]" />
    ),
    information: (
      <IoIosInformationCircleOutline className="inline text-blue-400 text-[30px] md:text-[20px]" />
    ),
    warning: (
      <IoWarningOutline className="inline text-yellow-400 text-[30px] md:text-[20px]" />
    ),
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onclose) onclose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onclose]);
  return (
    <div
      className={`fixed lg:top-32 top-20 w-50 md:w-auto left-[50vw] translate-x-[-50%] bg-[#1a1a2e] rounded-[7px] border-b-4 z-50 ${borderColors[type]}`}
    >
      <div className="text-white px-3 py-2 flex items-center justify-center gap-2">
        {icons[type]}
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
