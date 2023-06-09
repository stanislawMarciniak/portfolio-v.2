import React from "react";
import { commandExists } from "../utils/commandExists";
import { shell } from "../utils/shell";
import { handleTabCompletion } from "../utils/tabCompletion";
import { Ps1 } from "./Ps1";
import { useDispatch, useSelector } from "react-redux";
import { fold, unfold } from "../redux/folder";
import { selectFoldedState } from "../redux/folder";
import { useMediaQuery } from "@chakra-ui/react";

export const Input = ({
  inputRef = null,
  containerRef = null,
  command,
  history,
  lastCommandIndex,
  setCommand,
  setHistory,
  setLastCommandIndex,
  clearHistory,
}) => {
  const dispatch = useDispatch();
  const folded = useSelector(selectFoldedState);
  const [isSmallerThanLg] = useMediaQuery("(max-width: 1024px)");

  const onSubmit = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const commands: [string] = history
      .map(({ command }) => command)
      .filter((command: string) => command);

    if (event.key === "c" && event.ctrlKey) {
      event.preventDefault();
      setCommand("");
      setHistory("");
      setLastCommandIndex(0);
    }

    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      clearHistory();
    }

    if (event.key === "Tab") {
      event.preventDefault();
      handleTabCompletion(command, setCommand);
    }

    if (event.key === "Enter" || event.code === "13") {
      if (command === "close" || command === "open") {
        command === "close" ? dispatch(fold()) : dispatch(unfold());
      }
      event.preventDefault();
      setLastCommandIndex(0);
      await shell(command, setHistory, clearHistory, setCommand);
      containerRef?.current?.scrollTo(0, containerRef.current.scrollHeight);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      const index: number = lastCommandIndex + 1;
      if (index <= commands.length) {
        setLastCommandIndex(index);
        setCommand(commands[commands.length - index]);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!commands.length) {
        return;
      }
      const index: number = lastCommandIndex - 1;
      if (index > 0) {
        setLastCommandIndex(index);
        setCommand(commands[commands.length - index]);
      } else {
        setLastCommandIndex(0);
        setCommand("");
      }
    }
  };

  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(value);
  };

  return (
    <div className="flex flex-row space-x-2">
      {folded && isSmallerThanLg ? null : (
        <label htmlFor="prompt" className="min-w-fit">
          <Ps1 />
        </label>
      )}
      <input
        placeholder={folded ? "type open ;)" : ""}
        ref={inputRef}
        id="prompt"
        type="text"
        className={`bg-dark-background focus:outline-none flex-grow w-1/3 ${
          commandExists(command) || command === ""
            ? "text-dark-green"
            : "text-dark-red"
        }`}
        value={command}
        onChange={onChange}
        autoFocus
        onKeyDown={onSubmit}
        autoComplete="off"
        spellCheck="false"
      />
    </div>
  );
};

export default Input;
