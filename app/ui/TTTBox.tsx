import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface ITTTBox {
  status: number;
  onClick: Function;
}

export function TTTBox({ status, onClick }: ITTTBox) {
  return (
    <div
      className={`w-40 h-40 border-solid border-2 border-black m-1 bg-${
        status === 3 ? "red" : "black"
      } font-light flex justify-center items-center`}
      onClick={() => onClick()}
    >
      {status > 1 ? null : (
        <FontAwesomeIcon
          icon={status === 1 ? faCircle : faXmark}
          size={status === 1 ? "8x" : "10x"}
          color="white"
        />
      )}
    </div>
  );
}
