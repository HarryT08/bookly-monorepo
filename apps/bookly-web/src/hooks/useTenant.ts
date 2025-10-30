import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTenant,
  setTenantColors,
  setTenantError,
  setTenantLoading,
} from "@/store/slices/tenantSlice";
import { DEFAULT_TENANT_CONFIG, TenantConfig } from "@/types/tenant";
import { applyTenantColors, generateTenantColors } from "@/utils/colors";
import { useEffect, useRef } from "react";

export const useTenant = () => {
  const dispatch = useAppDispatch();
  const { currentTenant, colors, isLoading, error } = useAppSelector(
    (state) => state.tenant
  );
  const initialized = useRef(false);

  /**
   * Load tenant configuration based on domain or tenant ID
   */
  const loadTenant = async (tenantId?: string) => {
    try {
      console.log("loadTenant called with:", tenantId);
      dispatch(setTenantLoading(true));
      dispatch(setTenantError(null));

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // In a real app, this would fetch from an API
      // For now, we'll use the default configuration or mock data
      let tenantConfig: TenantConfig = { ...DEFAULT_TENANT_CONFIG };

      if (tenantId && tenantId !== "default") {
        // Mock tenant data - in production this would come from API
        tenantConfig = {
          ...DEFAULT_TENANT_CONFIG,
          id: tenantId,
          name: `Tenant ${tenantId}`,
          colors: {
            primary: "#2563EB",
            secondary: "#14B8A6",
          },
        };
      }

      console.log("Generated tenant config:", tenantConfig);

      // Generate color palettes
      const tenantColors = generateTenantColors(
        tenantConfig.colors.primary,
        tenantConfig.colors.secondary
      );

      console.log("Generated tenant colors:", tenantColors);

      // Apply colors to CSS custom properties
      if (typeof window !== "undefined") {
        applyTenantColors(tenantColors);
        console.log("Applied tenant colors to CSS");
      }

      dispatch(setTenant(tenantConfig));
      dispatch(setTenantColors(tenantColors));

      console.log("Tenant loading completed successfully");
    } catch (err) {
      console.error("Error loading tenant:", err);
      dispatch(
        setTenantError(
          err instanceof Error ? err.message : "Failed to load tenant"
        )
      );
    } finally {
      console.log("Setting tenant loading to false");
      dispatch(setTenantLoading(false));
    }
  };

  /**
   * Update tenant colors dynamically
   */
  const updateTenantColors = (primary: string, secondary: string) => {
    const tenantColors = generateTenantColors(primary, secondary);
    applyTenantColors(tenantColors);

    dispatch(setTenantColors(tenantColors));
    dispatch(
      setTenant({
        ...currentTenant,
        colors: { primary, secondary },
      })
    );
  };

  /**
   * Get tenant logo (SVG or URL)
   */
  const getTenantLogo = () => {
    return (
      currentTenant.logo?.svg ||
      currentTenant.logo?.url ||
      DEFAULT_TENANT_CONFIG.logo?.svg
    );
  };

  /**
   * Initialize tenant from domain or localStorage
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialized.current) return;

    console.log("Initializing tenant system...");
    initialized.current = true;

    // Get tenant from domain or localStorage
    const hostname = window.location.hostname;
    const storedTenantId = localStorage.getItem("bookly-tenant-id");

    // Extract tenant from subdomain (e.g., ufps.booklyapp.com -> ufps)
    let tenantId = "default";
    if (hostname.includes(".") && !hostname.includes("localhost")) {
      const subdomain = hostname.split(".")[0];
      if (subdomain && subdomain !== "www") {
        tenantId = subdomain;
      }
    } else if (storedTenantId) {
      tenantId = storedTenantId;
    }

    console.log("Loading tenant:", tenantId);
    loadTenant(tenantId).catch((err) => {
      console.error("Failed to load tenant:", err);
      // Force loading to false if something goes wrong
      dispatch(setTenantLoading(false));
    });
  }, []);

  return {
    tenant: currentTenant,
    colors,
    isLoading,
    error,
    loadTenant,
    updateTenantColors,
    getTenantLogo,
  };
};
