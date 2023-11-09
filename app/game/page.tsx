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
  const [gameStatus, setGameStatus] = useState<number>(0);
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

        socket.on("onStart", ({ room, firstTurn }) => {
          setGameStatus(1);
          setRoom(room);

          if (localStorage.getItem("username") === firstTurn) {
            setYourStatus(0);
          } else {
            setYourStatus(1);
          }
        });

        socket.on(
          "onDraw",
          ({
            row,
            col,
            status: opStatus,
          }: {
            row: number;
            col: number;
            status: number;
          }) => {
            setBoxVals((vals) => {
              const result = [...vals];
              result[row][col] = opStatus;

              let tmp = result[row].reduce((prev, val) =>
                prev === val ? prev : -1
              );
              if (tmp === 0 || tmp === 1) {
                for (let i = 0; i < 3; i++) {
                  result[row][i] = 3;
                }
              }
              tmp = result
                .map((row) => row[col])
                .reduce((prev, val) => (prev === val ? prev : -1));
              if (tmp === 0 || tmp === 1) {
                for (let i = 0; i < 3; i++) {
                  result[i][col] = 3;
                }
              }
              tmp = result
                .map((row, index) => row[index])
                .reduce((prev, val) => (prev === val ? prev : -1));
              if (tmp === 0 || tmp === 1) {
                for (let i = 0; i < 3; i++) {
                  result[i][i] = 3;
                }
              }
              tmp = result
                .map((row, index) => row[2 - index])
                .reduce((prev, val) => (prev === val ? prev : -1));
              if (tmp === 0 || tmp === 1) {
                for (let i = 0; i < 3; i++) {
                  result[i][2 - i] = 3;
                  console.log([...result]);
                }
              }

              return result;
            });

            setStatus((opStatus + 1) % 2);
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
    if (status === yourStatus && boxVals[row][col] === 2) {
      socket.emit("draw", { row, col, status, room });
    }
  };

  return (
    <main className="md:flex min-h-screen p-6">
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

      <div>
        {gameStatus === 0 ? (
          <span>Waiting for another user...</span>
        ) : gameStatus === 1 ? (
          <span>Game started</span>
        ) : (
          <span>Game Over</span>
        )}
      </div>
    </main>
  );
}
