"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function Page() {
  const [username, setUsername] = useState<string>("");

  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username !== "") {
      localStorage.setItem("username", username + Date.now());
      router.push("/game");
    }
  };

  return (
    <div className="w-48 mx-auto mt-48">
      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Input your username
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              type="text"
              name="price"
              id="price"
              className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
