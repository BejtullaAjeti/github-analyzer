import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  GithubUser,
  ReposResponse,
  ActivityPoint,
  RepoDetail,
  RepoHealth,
  CommitFrequencyPoint,
  ContributorSummary,
  RepoLanguages
} from '../../shared/models/github.models';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProfile(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`${this.apiUrl}/profile/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepos(username: string): Observable<ReposResponse> {
    return this.http.get<ReposResponse>(`${this.apiUrl}/repos/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getActivity(username: string): Observable<ActivityPoint[]> {
    return this.http.get<ActivityPoint[]>(`${this.apiUrl}/activity/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepoDetail(owner: string, repo: string): Observable<RepoDetail> {
    return this.http.get<RepoDetail>(`${this.apiUrl}/repo/${owner}/${repo}`).pipe(
      catchError(this.handleError)
    );
  }

  getRepoHealth(owner: string, repo: string): Observable<RepoHealth> {
    return this.http.get<RepoHealth>(`${this.apiUrl}/repo/${owner}/${repo}/health`).pipe(
      catchError(this.handleError)
    );
  }

  getRepoLanguages(owner: string, repo: string): Observable<RepoLanguages> {
    return this.http
      .get<RepoLanguages>(`${this.apiUrl}/repo/${owner}/${repo}/languages`)
      .pipe(catchError(this.handleError));
  }

  getCommitFrequency(owner: string, repo: string): Observable<CommitFrequencyPoint[] | 'computing'> {
    return this.http
      .get<CommitFrequencyPoint[]>(`${this.apiUrl}/repo/${owner}/${repo}/commits`, { observe: 'response' })
      .pipe(
        map(res => (res.status === 202 ? 'computing' : (res.body as CommitFrequencyPoint[]))),
        catchError(this.handleError)
      );
  }

  getContributors(owner: string, repo: string): Observable<ContributorSummary[]> {
    return this.http
      .get<ContributorSummary[]>(`${this.apiUrl}/repo/${owner}/${repo}/contributors`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: { status: number }): Observable<never> {
    if (err.status === 404) {
      return throwError(() => new Error('not found'));
    }
    return throwError(() => new Error('failed to fetch data'));
  }
}
