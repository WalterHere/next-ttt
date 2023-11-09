import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface TTTTBox {
  status: number;
  onClick: Function;
}

export function TTTBox({ status, onClick }: TTTTBox) {
  return (
    <div
      className="w-40 h-40 border-solid border-2 border-black m-1 bg-black font-light"
      onClick={() => onClick()}
    >
      {status === 2 ? null : (
        <FontAwesomeIcon
          icon={status === 1 ? faCircle : faXmark}
          size="10x"
          color="white"
        />
      )}
    </div>
  );
}
