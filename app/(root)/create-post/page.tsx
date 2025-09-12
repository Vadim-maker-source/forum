"use client";

import { useState, useTransition } from "react";
import { createPostAction } from "@/app/lib/api/posts";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Themes } from "@/app/lib/constants";

export default function CreatePostPage() {
  const [text, setText] = useState("");
  const [header, setHeader] = useState("");
  const [category, setCategory] = useState("");
  const [medias, setMedias] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMedias((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const submit = () =>
    start(async () => {
      try {
        if (text.length === 0) {
          toast.error("Введите текст");
          return;
        }
        if (!category) {
          toast.error("Выберите тему поста");
          return;
        }
        
        setError(null);
        await createPostAction({ type: "TEXT", text, medias, header, cate: category });
        setText("");
        setHeader("");
        setCategory("");
        setMedias([]);
        toast.success("Публикация успешно создана");
        window.location.href = "/";
      } catch (e: any) {
        toast.error(e?.message || "Ошибка создания поста");
      }
    });

  return (
    <div className="max-w-3xl w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Создать пост</h1>

      <input 
        type="text" 
        placeholder="Заголовок..." 
        value={header} 
        onChange={(e) => setHeader(e.target.value)} 
        className="px-4 py-2 w-full h-10 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200 mb-3" 
      />

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full mb-3">
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

      <textarea
        className="px-4 py-2 w-full h-20 min-h-10 max-h-48 rounded-lg border border-gray-200 focus:border-orange-500 outline-0 hover:border-gray-300 duration-200 mb-3"
        placeholder="Текст…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="my-3">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="w-full border rounded p-2 dark:bg-gray-800"
        />
        <div className="text-xs text-gray-500 mt-1">
          Можно выбрать несколько файлов (изображения или видео)
        </div>

        {medias.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {medias.map((media, index) => (
              <div key={index} className="relative">
                {media.startsWith('data:image') ? (
                  <img 
                    src={media} 
                    alt={`Preview ${index}`} 
                    className="w-full h-20 object-cover rounded"
                  />
                ) : (
                  <video 
                    src={media} 
                    className="w-full h-20 object-cover rounded"
                    controls
                  />
                )}
                <button
                  onClick={() => setMedias(prev => prev.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={pending}
        className={`flex items-center justify-center w-full ${
          pending ? "border-orange-100 bg-orange-100" : "border-orange-500 bg-orange-500"
        } p-3 border hover:bg-orange-100 text-white rounded-lg duration-300 cursor-pointer hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {pending ? <Loader2 className="animate-spin" /> : "Опубликовать"}
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}