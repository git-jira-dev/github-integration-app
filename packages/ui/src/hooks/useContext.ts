import { apiSlice } from '@/app/store/api/apiSlice';
import { invoke, view } from '@forge/bridge';
import type { FullContext } from '@forge/bridge/out/types';
import { PullRequest, PullRequestReview, ResolverResponse } from '@app/shared';

const contextApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getContext: builder.query<FullContext, void>({
      queryFn: async () => {
        try {
          const context = await view.getContext();
          return {
            data: context,
          };
        } catch (error) {
          return { error: String(error) };
        }
      },
    }),
    getPrForTicket: builder.query<PullRequest[], void>({
      queryFn: async () => {
        try {
          const { data, error }: ResolverResponse<PullRequest[]> = await invoke('getPrsForTicket');
          if (error) {
            return { error: error.message };
          }
          return {
            data: data,
          };
        } catch (error) {
          return { error: String(error) };
        }
      },
    }),
    getReviewersForPr: builder.query<PullRequestReview[], { id: string; repo_full_name: string }>({
      queryFn: async ({ id, repo_full_name }) => {
        try {
          const { data, error }: ResolverResponse<PullRequestReview[]> = await invoke('getPrReviewers', { id, full_name: repo_full_name });
          if (error) {
            return { error: error.message };
          }
          return {
            data,
          };
        } catch (error) {
          return { error: String(error) };
        }
      },
    }),
  }),
});

export const { useGetContextQuery, useGetPrForTicketQuery, useGetReviewersForPrQuery } = contextApi;
