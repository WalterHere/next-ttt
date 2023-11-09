"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button, Card, Spinner, Row, Col } from "react-bootstrap";
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
  const [checkVals, setCheckVals] = useState([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
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
          socket.emit(
            "login",
            localStorage.getItem("username"),
            localStorage.getItem("name")
          );
        });

        socket.on("onStart", (room, firstTurn, users) => {
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
              return result;
            });

            setStatus((opStatus + 1) % 2);
          }
        );

        socket.on("onOver", (winner) => {
          setGameStatus(2);
          alert(`The winner is ${winner}.`);
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
    }
  };

  return (
    <Row className="p-10">
      <Col className="flex flex-col">
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
          <span className="text-3xl font-bold">
            {localStorage.getItem("name")}
          </span>
          <span className="italic mx-3">VS</span>
          <span className="text-3xl font-bold">
            {localStorage.getItem("name")}
          </span>
        </div>
      </Col>

      <Col>
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
                <span>Game Over</span>
              )}
            </div>
            {gameStatus === 2 ? (
              <Button variant="primary">Go somewhere</Button>
            ) : null}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
