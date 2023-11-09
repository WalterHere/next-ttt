"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Card, Spinner, Row, Col } from "react-bootstrap";
import { io, Socket } from "socket.io-client";
import { withSwal, SweetAlert2Props } from "react-sweetalert2";

import { TTTBox } from "../ui/TTTBox";

export type UserInfo = {
  username: string;
  name: string;
};

let socket: Socket;

export default withSwal(({ swal }: { swal: any }) => {
  const router = useRouter();
  const [boxVals, setBoxVals] = useState([
    [2, 2, 2],
    [2, 2, 2],
    [2, 2, 2],
  ]);
  const [checkVals, setCheckVals] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [room, setRoom] = useState<string>("");
  const [opponent, setOpponent] = useState<UserInfo>();
  const [gameStatus, setGameStatus] = useState<number>(0);
  const [status, setStatus] = useState<number>(0);
  const [yourStatus, setYourStatus] = useState<number>(-1);
  const [name, setName] = useState<string>();
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    const storageUsername = localStorage.getItem("username");
    const storageName = localStorage.getItem("name");

    if (!storageUsername || !storageName) {
      router.push("/");
    } else {
      setUsername(storageUsername);
      setName(storageName);

      fetch("/api/socket").then(() => {
        socket = io({ query: { username: storageUsername } });

        socket.on("connect", () => {
          socket.emit("login", storageUsername, storageName);
        });

        socket.on("onStart", (room, users: UserInfo[], starterIndex) => {
          setGameStatus(1);
          setRoom(room);
          setBoxVals([
            [2, 2, 2],
            [2, 2, 2],
            [2, 2, 2],
          ]);
          setCheckVals([
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ]);
          setStatus(0);

          if (storageUsername === users[starterIndex].username) {
            setYourStatus(0);
            setOpponent(users[1 - starterIndex]);
            swal.fire({ title: "Game started!", text: "Your turn first." });
          } else {
            setYourStatus(1);
            setOpponent(users[starterIndex]);
            swal.fire({
              title: "Game started!",
              text: "Your opponent turn first.",
            });
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
              return result;
            });

            setStatus((opStatus + 1) % 2);
          }
        );

        socket.on("onOver", (winner: UserInfo) => {
          setGameStatus(2);
          if (winner.username === storageUsername) {
            swal.fire({
              title: "Congratulations!",
              text: "You won!",
            });
          } else {
            swal.fire({ title: "Game Over", text: "You lost!" });
          }
        });

        socket.on("disconnect", () => {
          console.log("Disconnected");
        });
      });
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    let tmp = -1,
      isOver = -1;

    for (let j = 0; j < 3; j++) {
      tmp = boxVals[j].reduce((prev, val) => (prev === val ? prev : -1));
      if (tmp === 0 || tmp === 1) {
        for (let i = 0; i < 3; i++) {
          checkVals[j][i] = 1;
        }

        isOver = tmp;
      }
    }
    for (let j = 0; j < 3; j++) {
      tmp = boxVals
        .map((row) => row[j])
        .reduce((prev, val) => (prev === val ? prev : -1));
      if (tmp === 0 || tmp === 1) {
        for (let i = 0; i < 3; i++) {
          checkVals[i][j] = 1;
        }
        isOver = tmp;
      }
    }
    tmp = boxVals
      .map((row, index) => row[index])
      .reduce((prev, val) => (prev === val ? prev : -1));
    if (tmp === 0 || tmp === 1) {
      for (let i = 0; i < 3; i++) {
        checkVals[i][i] = 1;
      }
      isOver = tmp;
    }
    tmp = boxVals
      .map((row, index) => row[2 - index])
      .reduce((prev, val) => (prev === val ? prev : -1));
    if (tmp === 0 || tmp === 1) {
      for (let i = 0; i < 3; i++) {
        checkVals[i][2 - i] = 1;
      }
      isOver = tmp;
    }

    if (isOver !== -1 && socket) {
      setCheckVals([...checkVals]);
      socket.emit("over", isOver, room);
    }
  }, [boxVals]);

  const handleBoxToogle = (row: number, col: number) => {
    if (status === yourStatus && boxVals[row][col] === 2 && gameStatus === 1) {
      socket.emit("draw", { row, col, status, room });
    } else if (status !== yourStatus) {
      swal.fire({ text: "It's not your turn!", icon: "warning" });
    }
  };

  const handleRestart = () => {
    socket.emit("restart", username, room);
  };

  return (
    <Row className="p-10">
      <Col className="flex flex-col w-auto">
        {boxVals.map((row, index) => (
          <div className="flex" key={index}>
            {row.map((col, ind) => (
              <TTTBox
                key={ind}
                status={col}
                checkStatus={checkVals[index][ind] === 1}
                onClick={() => handleBoxToogle(index, ind)}
              />
            ))}
          </div>
        ))}
        <div className="mt-3">
          <span className="text-3xl font-bold">{name}</span>
          <span className="italic mx-3">VS</span>
          <span className="text-3xl font-bold">{opponent?.name}</span>
        </div>
      </Col>

      <Col md="5" className="mt-3 md:mt-0">
        <Card>
          <Card.Body>
            <div className="mb-3">
              {gameStatus === 0 ? (
                <div className="flex items-center">
                  <Spinner animation="border" className="mr-5" />
                  <span>Waiting for another user...</span>
                </div>
              ) : gameStatus === 1 ? (
                <span>Game started</span>
              ) : (
                <Button variant="primary" onClick={() => handleRestart()}>
                  Play again
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
});
