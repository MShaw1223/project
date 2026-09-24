import { NextPage } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries, useQuery } from "react-query";
import { Activity, Hash, LayoutDashboard, Target, Trophy, UserRound } from "lucide-react";
import withSession, { SessionProps } from "@/components/withSession";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatTile } from "@/components/home/StatTile";
import { ChartCard } from "@/components/home/ChartCard";
import { NetResultChart } from "@/components/home/NetResultChart";
import { PairWinRateChart } from "@/components/home/PairWinRateChart";
import { OutcomesByAccountChart } from "@/components/home/OutcomesByAccountChart";
import { AccountSummaryTable } from "@/components/home/AccountSummaryTable";
import { FormError } from "@/components/FormFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNTS_QUERY_KEY, getAccounts } from "@/lib/accounts";
import { PROFILE_QUERY_KEY, getProfile } from "@/lib/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trade, getTrades, tradesQueryKey } from "@/lib/trades";
import {
  computeAccountStats,
  countOutcomes,
  netResultOverTime,
  winRateByPair,
} from "@/lib/tradeStats";

const ALL_ACCOUNTS = "all";
const TOP_PAIRS = 8;

const Home: NextPage<SessionProps> = ({ user }) => {
  const [accountFilter, setAccountFilter] = useState(ALL_ACCOUNTS);
  const accountsQuery = useQuery(ACCOUNTS_QUERY_KEY, getAccounts);
  const profileQuery = useQuery(PROFILE_QUERY_KEY, getProfile);
  const username = profileQuery.data?.username ?? null;
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data]);
  const tradeQueries = useQueries(
    accounts.map((account) => ({
      queryKey: tradesQueryKey(account.id),
      queryFn: () => getTrades(account.id),
    }))
  );

  const loading = accountsQuery.isLoading || tradeQueries.some((query) => query.isLoading);
  const tradesFailed = tradeQueries.some((query) => query.isError);
  // an account whose trades failed to load counts as having none, the error banner calls it out
  const tradesByAccount = accounts.map((account, index) => ({
    account,
    trades: (tradeQueries[index]?.data ?? []) as Trade[],
  }));

  const filteredTrades = tradesByAccount
    .filter(({ account }) => accountFilter === ALL_ACCOUNTS || account.id === accountFilter)
    .flatMap(({ trades }) => trades);
  const stats = computeAccountStats(filteredTrades);
  const outcomes = countOutcomes(filteredTrades);
  const netSeries = netResultOverTime(filteredTrades);
  const pairRates = winRateByPair(filteredTrades);
  const net = outcomes.win - outcomes.loss;

  const noTrades = filteredTrades.length === 0;
  const noTradesMessage = (
    <span>
      No trades yet.{" "}
      <Link href="/Trade-Entry" className="font-medium text-foreground underline-offset-4 hover:underline">
        Record one
      </Link>
    </span>
  );

  return (
    <>
      <title>FXTrax - Home</title>
      <PageHeader
        icon={LayoutDashboard}
        title="Overview"
        description={username ? `Welcome back, ${username}` : `Signed in as ${user.email}`}
        actions={
          accounts.length > 0 && (
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Filter by account">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ACCOUNTS}>All accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      />

      {profileQuery.isSuccess && username === null && (
        <Alert className="mb-6" role="status">
          <UserRound />
          <AlertDescription>
            You haven&apos;t chosen a username yet.{" "}
            <Link href="/users" className="font-medium underline-offset-4 hover:underline">
              Add one on your profile
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {accountsQuery.isError ? (
        <FormError message="Failed to load your accounts." />
      ) : !loading && accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Create your first account</CardTitle>
            <CardDescription>
              Trades are recorded against a brokerage account. Add one to start journaling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/account-management">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tradesFailed && <FormError message="Some accounts' trades failed to load, their stats show as empty." />}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={Hash}
              label="Total trades"
              value={String(stats.totalTrades)}
              detail={`${outcomes.win} won · ${outcomes.loss} lost · ${outcomes.breakeven} breakeven`}
              loading={loading}
            />
            <StatTile
              icon={Target}
              label="Win rate"
              value={stats.winPercentage !== undefined ? `${stats.winPercentage}%` : "—"}
              detail="Wins as a share of all trades"
              loading={loading}
            />
            <StatTile
              icon={Activity}
              label="Net result"
              value={net > 0 ? `+${net}` : String(net)}
              detail="Wins minus losses"
              loading={loading}
            />
            <StatTile
              icon={Trophy}
              label="Best pair"
              value={stats.bestPair ?? "—"}
              detail={stats.worstPair ? `Most losses: ${stats.worstPair}` : "Pair with the most wins"}
              loading={loading}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Net result over time"
              description="Running total of wins minus losses"
              loading={loading}
              empty={noTrades && noTradesMessage}
            >
              <NetResultChart data={netSeries} />
            </ChartCard>
            <ChartCard
              title="Win rate by pair"
              description={
                pairRates.length > TOP_PAIRS ? `Top ${TOP_PAIRS} of ${pairRates.length} pairs` : "Share of trades won"
              }
              loading={loading}
              empty={noTrades && noTradesMessage}
            >
              <PairWinRateChart data={pairRates.slice(0, TOP_PAIRS)} />
            </ChartCard>
          </div>

          <ChartCard
            title="Outcomes by account"
            description="Wins, breakevens and losses across all accounts"
            loading={loading}
            empty={tradesByAccount.every(({ trades }) => trades.length === 0) && noTradesMessage}
          >
            <OutcomesByAccountChart
              data={tradesByAccount.map(({ account, trades }) => ({
                account: account.name,
                ...countOutcomes(trades),
              }))}
            />
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Per-account breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSummaryTable
                rows={tradesByAccount.map(({ account, trades }) => ({
                  id: account.id,
                  name: account.name,
                  ...computeAccountStats(trades),
                }))}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
export default withSession(Home);
