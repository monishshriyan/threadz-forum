"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UsernameValidator } from "@/lib/validators/username";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { DialogFooter } from "@/components/ui/Dialog";
import { Loader2 } from "lucide-react";

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "username">;
}

type FormData = z.infer<typeof UsernameValidator>;

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: FormData) => {
      if (name === user.username) {
        throw new Error('SAME_USERNAME');
      }
      const payload: FormData = { name };

      const { data } = await axios.patch(`/api/username/`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        
        if (err.response?.status === 409) {
          return toast.error(
            "Username already taken.",{
            description: "Please choose another username.",
          });
        }
      }

      return toast.error(
        "Something went wrong.",{
        description: "Your username was not updated. Please try again.",
    });
    },
    onSuccess: () => {
      toast.success(
"Your username has been updated");
      router.refresh();
    },
  });

  return (
    <form
      className={cn("grid gap-4", className)}
      onSubmit={handleSubmit((e) => updateUsername(e))}
      {...props}
    >
      <div className="relative grid gap-1">
        <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
          <span className="text-sm text-zinc-400">u/</span>
        </div>
        <Label className="sr-only" htmlFor="name">
          Name
        </Label>
        <Input id="name" className="pl-6" size={32} {...register("name")} />
        {errors?.name && (
          <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      <DialogFooter>
        <Button disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirm
        </Button>
      </DialogFooter>
    </form>
  );
}
