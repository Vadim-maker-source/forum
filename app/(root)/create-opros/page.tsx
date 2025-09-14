"use client";

import { useState, useTransition } from "react";
import { createPostAction } from "@/app/lib/api/posts";
import { Separator } from "@/components/ui/separator";
import { Loader2, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Themes } from "@/app/lib/constants";

export default function CreateOprosPage() {
  const [text, setText] = useState("");
  const [header, setHeader] = useState("");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    const val = newOption.trim();
    if (!val){
      toast.error("Введите вариант ответа")
      return;
    }
    if (options.length >= 7) return alert("Максимум 7 вариантов");
    setOptions((p) => [...p, val]);
    setNewOption("");
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Успешно удален вариант ответа")
  };

  const submit = () =>
    start(async () => {
      try {
        if(text.length === 0){
          toast.error("Введите вопрос");
          return;
        }
        await createPostAction({ type: "POLL", text, pollOptions: options, header, cate: category });
        setText("")
        window.location.href = "/";
        toast.success("Публикация успешно создана")
      } catch (e: any) {
        setError(e?.message || "Ошибка создания опроса");
      }
    });

  return (
    <div className="max-w-md w-xs md:max-w-3xl md:w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Создать опрос</h1>

      <input type="text" placeholder="Заголовок..." value={header} onChange={(e) => setHeader(e.target.value)} className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200" />

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full mb-3 mt-3 px-4 py-4 text-md">
          <SelectValue placeholder="Выберите тему поста" />
        </SelectTrigger>
        <SelectContent>
          {Themes.map((theme) => (
            <SelectItem key={theme} value={theme}>
              {theme}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        className="w-full border rounded-lg px-3 py-2 mb-6 dark:bg-gray-800 outline-0 focus:border-orange-500 duration-200"
        placeholder="Вопрос"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Separator />

      <div className="mb-3 flex gap-2 mt-6">
        <input
          className="flex-1 border outline-0 focus:border-orange-500 duration-200 rounded-lg px-3 py-2 dark:bg-gray-800"
          placeholder="Новый вариант"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addOption()}
        />
        <button
          onClick={addOption}
          className="px-3 py-2 bg-orange-500 border border-orange-500 text-white rounded-lg hover:bg-orange-100 hover:text-orange-500 duration-300 cursor-pointer"
        >
          Добавить
        </button>
      </div>

      <ul className="mt-2 flex flex-col gap-2">
        {options.map((o, i) => (
          <li key={i} className="flex gap-2 items-center">
            <input
              value={o}
              onChange={(e) => updateOption(i, e.target.value)}
              className="flex-1 border outline-0 focus:border-orange-500 duration-200 rounded-lg px-3 py-2 dark:bg-gray-800"
            />
            <button
              onClick={() => removeOption(i)}
              className="px-3 py-2 bg-red-500 border border-red-500 text-white rounded-lg hover:bg-red-100 hover:text-red-500 duration-300 cursor-pointer"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={submit}
        disabled={pending}
        className={`mt-4 flex items-center justify-center w-full ${pending ? "border-orange-100 bg-orange-100" : "border-orange-500 bg-orange-500"} p-3 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500`}
      >
        {pending ? <Loader2 className="animate-spin" /> : "Опубликовать"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
