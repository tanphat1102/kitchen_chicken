import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";
import type { Store, CreateStoreDto } from "@/services/storeService";

interface StoreDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateStoreDto) => void;
  store?: Store | null;
}

export function StoreDialog({ open, onClose, onSave, store }: StoreDialogProps) {
  const [formData, setFormData] = useState<CreateStoreDto>({
    name: store?.name || "",
    address: store?.address || "",
    phone: store?.phone || "",
    createAt: new Date().toISOString(),
    isActive: store?.isActive ?? false, // Match backend default (false)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when store prop changes
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address,
        phone: store.phone,
        createAt: store.createAt,
        isActive: store.isActive,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        createAt: new Date().toISOString(),
        isActive: false, // Default to inactive as per backend
      });
    }
  }, [store]);

  const handleChange = (field: keyof CreateStoreDto, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof field === 'string' && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Store name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{store ? "Edit Store" : "Add New Store"}</DialogTitle>
          <DialogDescription>
            {store ? "Update store information" : "Create a new store location"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Store Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Store Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Chicken Kitchen - District 1"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              placeholder="Full address including street, district, city"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="+84 28 1234 5678"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="isActive">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.isActive ? 'true' : 'false'} 
              onValueChange={(value) => handleChange('isActive', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Active - Store is operational</span>
                  </div>
                </SelectItem>
                <SelectItem value="false">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span>Inactive - Store is closed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {!store && "New stores are inactive by default"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-black/90">
              {store ? "Update Store" : "Create Store"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
