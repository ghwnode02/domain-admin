// Cloudflare Workers Types for Pages Functions
// This file provides type definitions for Cloudflare Pages Functions

/// <reference types="@cloudflare/workers-types" />

declare global {
    /**
     * Cloudflare Pages Function handler type
     */
    type PagesFunction<Env = unknown> = (context: EventContext<Env, any, any>) => Response | Promise<Response>;

    /**
     * Cloudflare D1 Database interface
     */
    interface D1Database {
        prepare(query: string): D1PreparedStatement;
        dump(): Promise<ArrayBuffer>;
        batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
        exec(query: string): Promise<D1ExecResult>;
    }

    interface D1PreparedStatement {
        bind(...values: any[]): D1PreparedStatement;
        first<T = unknown>(colName?: string): Promise<T | null>;
        run<T = unknown>(): Promise<D1Result<T>>;
        all<T = unknown>(): Promise<D1Result<T>>;
        raw<T = unknown>(): Promise<T[]>;
    }

    interface D1Result<T = unknown> {
        results?: T[];
        success: boolean;
        error?: string;
        meta: {
            duration: number;
            size_after: number;
            rows_read: number;
            rows_written: number;
        };
    }

    interface D1ExecResult {
        count: number;
        duration: number;
    }

    /**
     * Event context for Pages Functions
     */
    interface EventContext<Env, Params extends string, Data> {
        request: Request;
        functionPath: string;
        waitUntil(promise: Promise<any>): void;
        passThroughOnException(): void;
        next(input?: Request | string, init?: RequestInit): Promise<Response>;
        env: Env;
        params: Record<Params, string>;
        data: Data;
    }
}

export { };
