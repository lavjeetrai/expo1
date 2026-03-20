"use client";

import * as React from "react";
import { format, setMonth, setYear } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";

type SubjectBlock = {
  subject: string;
  time: string;
};

const TIMETABLE: Record<number, SubjectBlock[]> = {
  1: [
    { subject: "FIC 125(V 308)", time: "09:00 To 09:50" },
    { subject: "FIC 125(V 308)", time: "10:00 To 10:50" },
    { subject: "SEC 171(V 308)", time: "11:00 To 11:50" },
    { subject: "SEC 171(V 308)", time: "12:00 To 12:50" },
    { subject: "VAC 102(APJ Abdul Kalam Auditorium)", time: "02:00 To 02:50" },
    { subject: "VAC 102(APJ Abdul Kalam Auditorium)", time: "03:00 To 03:50" },
  ],
  2: [
    { subject: "FIC 125(V 308)", time: "09:00 To 09:50" },
    { subject: "SEC 171(V 308)", time: "01:00 To 01:50" },
    { subject: "SEC 171(V 308)", time: "02:00 To 02:50" },
    { subject: "AEC 107(V 308)", time: "03:00 To 03:50" },
    { subject: "AEC 107(V 308)", time: "04:00 To 05:30" },
  ],
  3: [
    { subject: "CSE 102(V 308)", time: "09:00 To 09:50" },
    { subject: "CSE 102(V 308)", time: "10:00 To 10:50" },
    { subject: "FIC 117(V 308)", time: "11:00 To 11:50" },
    { subject: "FIC 117(V 308)", time: "12:00 To 12:50" },
  ],
  4: [
    { subject: "CSE 202(V 101)", time: "09:00 To 09:50" },
    { subject: "CSE 202(V 101)", time: "10:00 To 10:50" },
    { subject: "SEC 170(V 308)", time: "01:00 To 01:50" },
    { subject: "SEC 170(V 308)", time: "02:00 To 02:50" },
    { subject: "FIC 117(V 308)", time: "03:00 To 03:50" },
    { subject: "CSE 202(V 308)", time: "04:00 To 05:30" },
  ],
  5: [
    { subject: "CSE 202(V 308)", time: "09:00 To 09:50" },
    { subject: "CSE 202(V 308)", time: "10:00 To 10:50" },
    { subject: "SEC 170(V 308)", time: "11:00 To 11:50" },
    { subject: "CSE 102(V 308)", time: "12:00 To 12:50" },
    { subject: "CSE 102(V 101)", time: "03:00 To 03:50" },
    { subject: "CSE 102(V 101)", time: "04:00 To 05:30" },
  ],
};

export interface DropdownMultiCalendarProps {
  onComplete?: (data: { date: Date; subject: string; time: string }) => void;
}

const parseTime = (timeStr: string) => {
  const parts = timeStr.trim().split(':').map(Number);
  let h = parts[0];
  const m = parts[1];
  if (h >= 1 && h <= 5) h += 12; // PM adjustment for 01:00-05:59 mapped to 13:00-17:59
  return h * 60 + m;
};

export function DropdownMultiCalendar({ onComplete }: DropdownMultiCalendarProps) {
  const today = new Date();
  const [month, setMonthState] = React.useState(today.getMonth());
  const [year, setYearState] = React.useState(today.getFullYear());
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedSubject, setSelectedSubject] = React.useState<string>("");
  
  const [selectedHour, setSelectedHour] = React.useState<string>("");
  const [selectedMinute, setSelectedMinute] = React.useState<string>("");
  const [selectedSecond, setSelectedSecond] = React.useState<string>("00");

  const handleMonthChange = (newMonth: number) => {
    setMonthState(newMonth);
  };

  const handleYearChange = (newYear: number) => {
    setYearState(newYear);
  };

  const displayMonth = setMonth(setYear(today, year), month);

  const daySchedule = React.useMemo(() => {
    return selectedDate ? TIMETABLE[selectedDate.getDay()] || [] : [];
  }, [selectedDate]);
  
  const availableSubjects = React.useMemo(() => {
    const uniques = new Set<string>();
    daySchedule.forEach(block => uniques.add(block.subject));
    return Array.from(uniques);
  }, [daySchedule]);

  const availableIntervals = React.useMemo(() => {
    const intervals = daySchedule
      .filter(block => block.subject === selectedSubject)
      .map(block => block.time.split(' To ').map(t => parseTime(t.trim())));
    return intervals.map(iv => ({ start: iv[0], end: iv[1] }));
  }, [daySchedule, selectedSubject]);

  const validHours = React.useMemo(() => {
    const hours = new Set<number>();
    availableIntervals.forEach(iv => {
      const sH = Math.floor(iv.start / 60);
      const eH = Math.floor(iv.end / 60);
      for (let i = sH; i <= eH; i++) hours.add(i);
    });
    return Array.from(hours).sort((a,b)=>a-b);
  }, [availableIntervals]);

  const validMinutes = React.useMemo(() => {
    if (!selectedHour) return [];
    const hr = parseInt(selectedHour, 10);
    const mins = new Set<number>();
    
    for (let m = 0; m <= 59; m++) {
       const t = hr * 60 + m;
       const isValid = availableIntervals.some(iv => t >= iv.start && t <= iv.end);
       if (isValid) mins.add(m);
    }
    return Array.from(mins).sort((a,b)=>a-b);
  }, [availableIntervals, selectedHour]);

  React.useEffect(() => {
    setSelectedHour("");
    setSelectedMinute("");
    setSelectedSecond("00");
  }, [selectedSubject]);

  React.useEffect(() => {
    if (selectedMinute && !validMinutes.includes(parseInt(selectedMinute, 10))) {
      setSelectedMinute("");
    }
  }, [validMinutes, selectedMinute]);

  const handleConfirmDate = () => {
    if (selectedDate) setStep(2);
  };

  const handleFinalConfirm = () => {
    if (selectedDate && selectedSubject && selectedHour && selectedMinute && selectedSecond) {
      const hDisplay = parseInt(selectedHour, 10);
      const formatH = (hDisplay > 12 ? hDisplay - 12 : (hDisplay === 0 ? 12 : hDisplay)).toString().padStart(2, '0');
      const ampm = hDisplay >= 12 ? 'PM' : 'AM';
      const formatM = selectedMinute.padStart(2, '0');
      const formatS = selectedSecond.padStart(2, '0');
      const timeString = `${formatH}:${formatM}:${formatS} ${ampm}`;

      onComplete?.({ date: selectedDate, subject: selectedSubject, time: timeString });
    }
  };

  return (
    <Card className="w-[400px] shadow-none border-none bg-transparent text-inherit">
      <CardContent className="flex flex-col gap-4 mt-2">
        {step === 1 ? (
          <>
            <div className="flex gap-2">
              <Select
                value={year.toString()}
                onValueChange={(val: string) => handleYearChange(Number(val))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => year - 25 + i).map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={month.toString()}
                onValueChange={(val: string) => handleMonthChange(Number(val))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2000, i, 1), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={displayMonth}
              onMonthChange={(date: Date) => {
                setMonthState(date.getMonth());
                setYearState(date.getFullYear());
              }}
              disabled={(date: Date) => date.getDay() === 0 || date.getDay() === 6}
              className="rounded-md border p-3"
            />
          </>
        ) : (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold">{selectedDate && format(selectedDate, "PPPP")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Please specify your class</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs h-7">Edit Date</Button>
            </div>
            
            {availableSubjects.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-foreground">Subject</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSubject && availableIntervals.length > 0 && (
                  <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                    <label className="text-xs font-medium text-foreground">Exact Time (HH:MM:SS)</label>
                    <div className="flex items-center gap-2">
                      <Select value={selectedHour} onValueChange={setSelectedHour}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="HH" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {validHours.map(h => {
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                            return <SelectItem key={h} value={h.toString()}>
                              {displayH.toString().padStart(2, '0')} {ampm}
                            </SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                      <span className="font-bold text-lg">:</span>
                      <Select value={selectedMinute} onValueChange={setSelectedMinute} disabled={!selectedHour}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {validMinutes.map(m => (
                            <SelectItem key={m} value={m.toString()}>{m.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="font-bold text-lg">:</span>
                      <Select value={selectedSecond} onValueChange={setSelectedSecond} disabled={!selectedMinute}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="SS" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i.toString().padStart(2, '0')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive font-medium border border-destructive/20 bg-destructive/10 rounded-lg p-3">
                No subjects found for this date.
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t border-border/40 pt-4">
        {step === 1 ? (
          <Button
             size="sm"
             onClick={handleConfirmDate}
             disabled={!selectedDate}
          >
             Confirm Date
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleFinalConfirm}
            disabled={!selectedSubject || !selectedHour || !selectedMinute || !selectedSecond}
            className="flex items-center gap-2"
          >
            Confirm Selection <Check className="size-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
