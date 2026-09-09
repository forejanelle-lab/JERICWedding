"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { enterWithEmail } from "@/lib/gate/actions";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { householdNames, useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { InviteRecord } from "@/lib/hub/types";

const EMAIL_KEY = "jeric-gate-email";
const NAME_KEY = "jeric-gate-name";

const inputClass =
  "mt-1 w-full border-0 border-b border-[#242424]/25 bg-transparent px-0 py-2.5 font-sans text-base text-[#242424] placeholder:text-[#77736C]/70 focus:border-[#2D3B2D] focus:outline-none";

type EnterState = {
  error?: string;
  field?: "passcode" | "name" | "email";
};

type NameOption = {
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  inviteId: string;
  location: string;
};

function inviteNameOptions(invites: InviteRecord[]): NameOption[] {
  const seen = new Set<string>();
  const options: NameOption[] = [];
  for (const invite of invites) {
    if (invite.invited === false) continue;
    for (const label of householdNames(invite)) {
      const key = label.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const parts = label.trim().split(/\s+/);
      const isPrimary = label.toLowerCase() === `${invite.firstName} ${invite.lastName}`.trim().toLowerCase();
      options.push({
        label,
        firstName: isPrimary ? invite.firstName : (parts[0] ?? invite.firstName),
        lastName: isPrimary ? invite.lastName : (parts.slice(1).join(" ") || invite.lastName),
        email: invite.email,
        inviteId: invite.id,
        location: invite.location,
      });
    }
  }
  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function GatePage({
  next = "/",
}: {
  next?: string;
  linkError?: boolean;
}) {
  const { state } = useHub();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [passcodeEdited, setPasscodeEdited] = useState(false);
  const [manual, setManual] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => inviteNameOptions(state.invites), [state.invites]);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(EMAIL_KEY);
    const savedName = window.localStorage.getItem(NAME_KEY);
    if (savedEmail) setEmail(savedEmail);
    if (savedName) setName(savedName);
  }, []);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [name, options]);

  const selected = useMemo(() => {
    if (manual) return null;
    const q = name.trim().toLowerCase();
    return options.find((item) => item.label.toLowerCase() === q) ?? null;
  }, [manual, name, options]);

  const showManual = name.trim().length > 0 && !selected;

  const invite = useMemo(() => {
    if (selected) return state.invites.find((item) => item.id === selected.inviteId) ?? null;
    const needle = email.trim().toLowerCase();
    if (!needle) return null;
    return state.invites.find((item) => item.email.toLowerCase() === needle) ?? null;
  }, [email, selected, state.invites]);

  const firstName = selected?.firstName || name.trim().split(/\s+/)[0] || "";
  const lastName = selected?.lastName || name.trim().split(/\s+/).slice(1).join(" ") || invite?.lastName || "";

  function pick(option: NameOption) {
    setName(option.label);
    setEmail(option.email);
    setManual(false);
    setOpen(false);
  }

  function pickManual() {
    setManual(true);
    setOpen(false);
  }

  const [formState, formAction, pending] = useActionState(
    async (_prev: EnterState, formData: FormData): Promise<EnterState> => {
      const value = String(formData.get("email") ?? "").trim().toLowerCase();
      const entered = String(formData.get("name") ?? "").trim();
      if (value) window.localStorage.setItem(EMAIL_KEY, value);
      if (entered) window.localStorage.setItem(NAME_KEY, entered);
      setPasscodeEdited(false);
      return ((await enterWithEmail(formData)) as EnterState | void) ?? {};
    },
    {} as EnterState,
  );

  const passcodeInvalid = formState.field === "passcode" && !passcodeEdited;

  return (
    <main className="relative flex min-h-[100svh] items-start justify-center overflow-y-auto overflow-x-hidden sm:items-center">
      <EditImage
        id="gate.background"
        src="/images/casale-bosco.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#2D3B2D]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#242424]/80 via-[#242424]/25 to-[#242424]/40" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-4 py-10 text-center text-[#F9F7F2] sm:px-5 sm:py-16">
        <EditText id="gate.script" as="p" className="font-hand text-2xl text-[#F9F7F2]/85 md:text-3xl">
          We&apos;re getting married
        </EditText>
        <EditText id="gate.name1" as="h1" className="mt-3 font-serif text-[2.6rem] font-light leading-none tracking-[0.04em] uppercase sm:text-5xl md:text-7xl md:tracking-[0.08em]">
          Janelle
        </EditText>
        <span className="my-1 font-hand text-3xl italic text-[#F9F7F2]/90 md:text-4xl">&</span>
        <EditText id="gate.name2" as="h1" className="font-serif text-[2.6rem] font-light leading-none tracking-[0.04em] uppercase sm:text-5xl md:text-7xl md:tracking-[0.08em]">
          Eric
        </EditText>
        <EditText id="gate.dates" as="p" className="mt-5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-[#F9F7F2]/85 md:text-[0.62rem] md:tracking-[0.28em]">
          September 4–6, 2027
        </EditText>
        <div className="my-3 h-px w-10 bg-[#F9F7F2]/40" />
        <EditText id="gate.venue" as="p" className="max-w-[16rem] font-sans text-[0.72rem] uppercase leading-relaxed tracking-[0.14em] text-[#F9F7F2]/80 md:max-w-none md:text-[0.62rem] md:tracking-[0.28em]">
          Casale dei Mascioni · Campania, Italy
        </EditText>

        <div className="mt-8 w-full rounded-[20px] border border-[#E6E0D7]/80 bg-[#F9F7F2]/95 p-5 text-left text-[#242424] shadow-[0_16px_40px_rgba(0,0,0,0.18)] md:mt-10 md:p-8">
          <form action={formAction}>
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="location" value={selected?.location ?? invite?.location ?? ""} />
            <input type="hidden" name="inviteId" value={selected?.inviteId ?? ""} />
            <input type="hidden" name="fromList" value={selected ? "1" : "0"} />
            <p className="mb-5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-[#77736C] md:text-[0.58rem] md:tracking-[0.2em]">
              {t("gate.enterWeekend")}
            </p>
            <div className="space-y-5">
              <label className="block">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-[#77736C] md:text-[0.58rem] md:tracking-[0.2em]">
                  {t("gate.passcode")}
                </span>
                <input
                  name="passcode"
                  type="password"
                  required
                  autoComplete="off"
                  autoFocus
                  aria-invalid={passcodeInvalid}
                  onChange={() => setPasscodeEdited(true)}
                  className={
                    passcodeInvalid
                      ? "mt-1 w-full rounded-md border border-[#C45C4A] bg-transparent px-2 py-2.5 font-sans text-base tracking-[0.18em] text-[#242424] placeholder:text-[#77736C]/70 focus:border-[#C45C4A] focus:outline-none"
                      : `${inputClass} tracking-[0.18em]`
                  }
                  placeholder={t("gate.placeholder.passcode")}
                />
              </label>
              <div ref={boxRef} className="relative">
                <label className="block">
                  <span className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-[#77736C] md:text-[0.58rem] md:tracking-[0.2em]">
                    {t("gate.name")}
                  </span>
                  <input
                    name="name"
                    required
                    autoComplete="off"
                    className={inputClass}
                    placeholder={t("gate.placeholder.name")}
                    value={name}
                    onFocus={() => setOpen(true)}
                    onChange={(event) => {
                      setName(event.target.value);
                      setManual(false);
                      setOpen(true);
                      setHighlight(0);
                    }}
                    onKeyDown={(event) => {
                      const extra = showManual ? 1 : 0;
                      const total = matches.length + extra;
                      if (!open || total === 0) return;
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setHighlight((value) => (value + 1) % total);
                      }
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setHighlight((value) => (value - 1 + total) % total);
                      }
                      if (event.key === "Enter") {
                        if (highlight < matches.length && matches[highlight]) {
                          event.preventDefault();
                          pick(matches[highlight]);
                        } else if (showManual) {
                          event.preventDefault();
                          pickManual();
                        }
                      }
                      if (event.key === "Escape") setOpen(false);
                    }}
                  />
                </label>
                {open && (matches.length > 0 || showManual) ? (
                  <ul className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-[#E6E0D7] bg-[#F9F7F2] py-1 shadow-[0_12px_30px_rgba(36,36,36,0.12)]">
                    {matches.map((item, index) => (
                      <li key={`${item.inviteId}-${item.label}`}>
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-left font-sans text-sm ${
                            index === highlight ? "bg-[#2D3B2D] text-[#F9F7F2]" : "text-[#242424] hover:bg-[#E6E0D7]/70"
                          }`}
                          onMouseEnter={() => setHighlight(index)}
                          onClick={() => pick(item)}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                    {showManual ? (
                      <li>
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-left font-sans text-sm ${
                            highlight === matches.length ? "bg-[#2D3B2D] text-[#F9F7F2]" : "text-[#242424] hover:bg-[#E6E0D7]/70"
                          }`}
                          onMouseEnter={() => setHighlight(matches.length)}
                          onClick={pickManual}
                        >
                          {t("gate.manual")}
                        </button>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </div>
              <label className="block">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-[#77736C] md:text-[0.58rem] md:tracking-[0.2em]">
                  {t("gate.email")}
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder={t("gate.placeholder.email")}
                  value={email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEmail(value);
                    const match = state.invites.find(
                      (item) => item.email.toLowerCase() === value.trim().toLowerCase(),
                    );
                    if (match && !name) setName(`${match.firstName} ${match.lastName}`.trim());
                  }}
                />
              </label>
            </div>
            {formState.error ? (
              <p className="mt-5 font-sans text-sm text-[#2D3B2D]" role="alert">
                {t(formState.error)}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="mt-7 min-h-12 w-full rounded-full bg-[#2D3B2D] px-6 py-3.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-[#F9F7F2] transition-colors duration-200 hover:bg-[#3d4f3d] disabled:opacity-60 md:text-[0.62rem] md:tracking-[0.2em]"
            >
              {pending ? t("gate.entering") : t("gate.enter")}
            </button>
            <p className="mt-4 text-center font-sans text-xs text-[#77736C]">
              {t("gate.remember")}
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
