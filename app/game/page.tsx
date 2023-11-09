"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { TTTBox } from "../ui/TTTBox";

let socket: Socket;

export default function Page() {
  const router = useRouter();
  const [boxVals, setBoxVals] = useState([
    [2, 2, 2],
    [2, 2, 2],
    [2, 2, 2],
  ]);
  const [room, setRoom] = useState<string>("");
  const [status, setStatus] = useState<number>(0);
  const [yourStatus, setYourStatus] = useState<number>(-1);

  useEffect(() => {
    if (!localStorage.getItem("username")) {
      router.push("/");
    } else {
      fetch("/api/socket").then(() => {
        socket = io({ query: { username: localStorage.getItem("username") } });

        socket.on("connect", () => {
          socket.emit("login", localStorage.getItem("username"));
        });

        socket.on("startGame", (...arg) => {
          console.log(arg);
          // setRoom(room);
          // alert("Game started!");

          // if (localStorage.getItem("username") === firstTurn) {
          //   setYourStatus(0);
          // } else {
          //   setYourStatus(1);
          // }
        });

        socket.on(
          "onDraw",
          ({
            row,
            col,
            status,
          }: {
            row: number;
            col: number;
            status: number;
          }) => {
            boxVals[row][col] = status;
            setBoxVals([...boxVals]);

            setStatus(yourStatus);
          }
        );

        socket.on("disconnect", () => {
          console.log("Disconnected");
        });
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleBoxToogle = (row: number, col: number) => {
    if (status === yourStatus) {
      boxVals[row][col] = status;
      setBoxVals([...boxVals]);

      socket.emit("draw", { row, col, status, room });
    }
  };

  return (
    <main className="flex min-h-screen p-6">
      <div className="flex flex-col">
        {boxVals.map((row, index) => (
          <div className="flex" key={index}>
            {row.map((col, ind) => (
              <TTTBox
                key={ind}
                status={col}
                onClick={() => handleBoxToogle(index, ind)}
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
