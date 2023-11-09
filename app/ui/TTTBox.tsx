import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface ITTTBox {
  status: number;
  checkStatus: boolean;
  onClick: Function;
}

export function TTTBox({ status, checkStatus, onClick }: ITTTBox) {
  return (
    <div
      className={`w-40 h-40 border-solid border-2 border-black bg- m-1 bg-${
        checkStatus ? "red-700" : "black"
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
