import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Trash2, UserPlus, Users, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export interface Worker {
  id: string;
  name: string;
  phone: string;
  address: string;
  skill: string;
  createdAt: number;
}

const STORAGE_KEY = "workerpro_workers";

export function getWorkers(): Worker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWorkers(workers: Worker[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(() => getWorkers());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [skill, setSkill] = useState("");

  const handleRegister = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }
    const newWorker: Worker = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      skill: skill.trim(),
      createdAt: Date.now(),
    };
    const updated = [...workers, newWorker];
    saveWorkers(updated);
    setWorkers(updated);
    setName("");
    setPhone("");
    setAddress("");
    setSkill("");
    toast.success(`${newWorker.name} registered successfully!`);
  };

  const handleDelete = (id: string) => {
    const updated = workers.filter((w) => w.id !== id);
    saveWorkers(updated);
    setWorkers(updated);
    toast.success("Worker removed");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-700 text-foreground">
            Worker Registration
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Register workers who can accept job assignments
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="glass-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Register New Worker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="worker-name" className="text-sm font-500">
                  Full Name *
                </Label>
                <Input
                  id="worker-name"
                  data-ocid="workers.name.input"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="worker-phone" className="text-sm font-500">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="worker-phone"
                    data-ocid="workers.phone.input"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="worker-address" className="text-sm font-500">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="worker-address"
                    data-ocid="workers.address.input"
                    placeholder="e.g. 12 MG Road, Chennai"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="worker-skill" className="text-sm font-500">
                  Skill / Work Type
                </Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="worker-skill"
                    data-ocid="workers.skill.input"
                    placeholder="e.g. Plumbing, Painting, Electrical"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="bg-input/50 pl-10"
                  />
                </div>
              </div>
            </div>
            <Button
              data-ocid="workers.register.button"
              onClick={handleRegister}
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register Worker
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-600 text-foreground">
            Registered Workers
          </h2>
          <Badge variant="secondary" className="font-mono">
            {workers.length} workers
          </Badge>
        </div>

        {workers.length === 0 ? (
          <div
            data-ocid="workers.empty_state"
            className="glass-card rounded-xl p-10 text-center"
          >
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-500">
              No workers registered yet
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Add workers above so they can be assigned to jobs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker, idx) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                data-ocid={`workers.item.${idx + 1}`}
                className="glass-card rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-700 text-sm">
                      {worker.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-600 text-foreground">{worker.name}</p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {worker.phone}
                    </p>
                    {worker.address && (
                      <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {worker.address}
                      </p>
                    )}
                    {worker.skill && (
                      <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                        <Wrench className="w-3 h-3" />
                        {worker.skill}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {worker.skill && (
                    <Badge variant="outline" className="text-xs hidden sm:flex">
                      {worker.skill}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    ID: {idx + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-ocid={`workers.delete_button.${idx + 1}`}
                    onClick={() => handleDelete(worker.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
