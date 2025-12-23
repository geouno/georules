import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RuleCreateBody,
  RuleResponse,
  RuleUpdateBody,
} from "@georules/core/api-contracts";
import { georulesClient } from "@/lib/georules";

/**
 * Query key factory for rules.
 */
export const ruleKeys = {
  all: ["rules"] as const,
  single: (id: string) => ["rules", id] as const,
};

/**
 * Hook to fetch all rules for the current user.
 */
export function useRules() {
  return useQuery({
    queryKey: ruleKeys.all,
    queryFn: () => georulesClient.getRules(),
  });
}

/**
 * Hook to fetch a single rule by ID.
 */
export function useRule(id: string | null) {
  return useQuery({
    queryKey: ruleKeys.single(id!),
    queryFn: () => georulesClient.getRule(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new rule.
 */
export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuleCreateBody) => georulesClient.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}

/**
 * Hook to update an existing rule.
 */
export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RuleUpdateBody }) =>
      georulesClient.updateRule(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
      queryClient.setQueryData(ruleKeys.single(updated.id), updated);
    },
  });
}

/**
 * Hook to delete a rule.
 */
export function useDeleteRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => georulesClient.deleteRule(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
      queryClient.removeQueries({ queryKey: ruleKeys.single(id) });
    },
  });
}
