import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import Options from "src/app/model/Options";
import Poll from "src/app/model/Poll";
import User from "src/app/model/User";
import { AuthService } from "src/app/services/auth/auth.service";
import { OrderService } from "src/app/services/order/order.service";
import { PollService } from "src/app/services/poll/poll.service";
import { SharedDataService } from "src/app/services/sharedData/shared-data.service";

@Component({
  selector: "app-poll",
  templateUrl: "./poll.component.html",
  styleUrls: ["./poll.component.css"],
})
export class PollComponent implements OnInit {
  userDetails!: User;
  polls: Poll[] = [];
  voteForm!: FormGroup;
  // poll = [
  //   {
  //     id: 102,
  //     options: [
  //       { id: 1, option: "Option A", score: 1 },
  //       { id: 2, option: "Option B", score: 1 },
  //     ],
  //     votedUsers: ["2"],
  //     title: "Sample Poll",
  //     visible: true,
  //     endDate: "2022-12-31",
  //   },
  //   {
  //     id: 152,
  //     options: [
  //       { id: 52, option: "Sabzi + roti", score: 0 },
  //       { id: 53, option: "Dal + Rice", score: 1 },
  //     ],
  //     votedUsers: ["1"],
  //     title: "Lunch Poll",
  //     visible: true,
  //     endDate: "2023-08-31",
  //   },
  // ];
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedDataService: SharedDataService,
    private authService: AuthService,
    private pollService: PollService
  ) {}

  ngOnInit(): void {
    this.sharedDataService.userDetailsObservable.subscribe((userDetails) => {
      this.userDetails = userDetails;
    });

    // todo:getCurrentPollforUser
    //check if for expired date of polls and then fetch it
    this.getPolls();
    this.voteForm = this.fb.group({
      answer: ["", [Validators.required]],
    });
  }

  onSubmit(pollId: number = 0) {

    //console.log(this.voteForm.value.answer);
    let optionId = this.voteForm.value.answer;
    if (pollId) {
      this.onSubmitVote(pollId, optionId);
    } else {
      this.toastr.error("pollId is undefined");
    }
  }

  setResults(options:Options[]){
    //set result for each option
    let totalScore = options.reduce((accumulator, currentOption) => {
      return accumulator + currentOption.score;
    }, 0);
    
    options.forEach((option) => {
      option.result = (option.score / totalScore)*100;
    });
  }

  checkIsNaN(result: number | undefined): boolean {
    return result !== undefined && isNaN(result);
  }


  onSubmitVote(pollId: number, optionId: number) {
    this.pollService.submitVote(pollId, optionId).subscribe(
      (res: any) => {
        // console.log(res);
        this.toastr.info(res);
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }

  getRole(): boolean {
    return this.authService.getRole();
  }

  formatEndDate(dateTime: string): string {
    let date = new Date(dateTime);
    console.log(dateTime)
    console.log( date.toLocaleTimeString())
    return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    // Output: "25 July 2023, 18:30" 
}

  getPolls() {
    this.pollService.getPolls().subscribe(
      (res: any) => {
        // console.log(res);
        this.polls = res;
        this.polls.forEach( poll => this.setResults( poll.options));
      },
      (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    );
  }
}
