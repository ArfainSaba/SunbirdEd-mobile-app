import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import * as _ from 'underscore';
import { TranslateService } from '@ngx-translate/core';
import { statuses } from '../../core/constants/statuses.constant';
import { UtilsService } from '@app/app/manage-learn/core/services/utils.service';
import { AppHeaderService } from '@app/services';
import {  ProjectService } from '../../core';
import { RouterLinks } from '@app/app/app.constant';
import { actions } from '../../core/constants/actions.constants';
import { GenericPopUpService } from '../../shared';
@Component({
  selector: 'app-project-templateview',
  templateUrl: './project-templateview.page.html',
  styleUrls: ['./project-templateview.page.scss'],
})
export class ProjectTemplateviewPage implements OnInit {
  showDetails: boolean = true;
  statuses = statuses;
  project: any;
  projectId;
  projectType = '';
  categories = [];
  isTargeted;
  taskCount: number = 0;
  filters: any = {};
  schedules = this.utils.getSchedules();
  sortedTasks;
  programId;
  solutionId;
  isNotSynced: boolean;
  locationChangeTriggered: boolean = false;
  allStrings;
  viewOnlyMode: boolean = false;
  templateId;
  templateDetailsPayload;
  importProjectClicked: boolean = false;
  fromImportProject: boolean = false;
  shareTaskId;
  networkFlag: boolean;
  id;
  headerConfig = {
    showHeader: true,
    showBurgerMenu: false,
    pageTitle: '',
    actionButtons: [],
  };
  projectProgress;
  actionItems = [];
  metaData: any;
  projectSegments;
  segmentType = "details";
  type;
  buttonLabel = 'FRMELEMNTS_LBL_START_IMPROVEMENT';
  stateData;
  isATargetedSolution;

  constructor(
    public params: ActivatedRoute,
    public popoverController: PopoverController,
    private router: Router,
    private utils: UtilsService,
    private translate: TranslateService,
    private headerService: AppHeaderService,
    private projectService: ProjectService,
    private popupService: GenericPopUpService,
  ) {

    params.params.subscribe((parameters) => {
      this.id = parameters.id;
    });
    params.queryParams.subscribe((parameters) => {
      this.isTargeted = parameters.isTargeted;
      this.programId = parameters.programId;
      this.solutionId = parameters.solutionId;
      this.isATargetedSolution = (parameters.isATargetedSolution === 'true');
    });
    this.stateData = this.router.getCurrentNavigation().extras.state;
    this.templateDetailsPayload = this.router.getCurrentNavigation().extras.state;
    this.translate
      .get([
        'FRMELEMNTS_MSG_SOMETHING_WENT_WRONG',
        'FRMELEMNTS_MSG_NO_ENTITY_MAPPED',
        'FRMELEMNTS_MSG_CANNOT_GET_PROJECT_DETAILS',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_MESSAGE',
        'YES',
        'NO',
        'FRMELEMNTS_LBL_IMPORT_PROJECT_SUCCESS',
      ])
      .subscribe((texts) => {
        this.allStrings = texts;
      });
  }

  templateDetailsInit() {
    switch (this.stateData?.referenceFrom) {
      case 'observation':
        this.templateId = this.id;
        this.getTemplateByExternalId();
        break
      case 'link':
        this.getProjectApi();
        break
      default:
        this.getProjectApi();
    }
  }

  ngOnInit() {
    this.headerConfig = this.headerService.getDefaultPageConfig();
    this.headerConfig.actionButtons = [];
    this.headerConfig.showHeader = true;
    this.headerConfig.showBurgerMenu = false;
    this.headerService.updatePageConfig(this.headerConfig);
  }

  ionViewWillEnter() {
    this.templateDetailsInit();
  }

  async getProjectApi() {
    this.actionItems = await actions.PROJECT_ACTIONS;
    let resp = await this.projectService.getTemplateBySoluntionId(this.id);
    this.project = resp.result;
    this.metaData = {
      title: this.project.title,
      subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
    }
    if (this.project.tasks && this.project.tasks.length)
      this.projectProgress = this.utils.getCompletedTaskCount(this.project.tasks);
  }

  async getTemplateByExternalId() {
    let resp = await this.projectService.getTemplateByExternalId(this.id);
    this.programId = resp?.result?.programInformation?.programId || null;
    this.project = resp?.result;
    if (this.project?.projectId) {
      this.buttonLabel = 'FRMELEMNTS_LBL_CONTINUE_IMPROVEMENT'
    }
    this.metaData = {
      title: this.project.title,
      subTitle: this.project?.programInformation ? this.project?.programInformation?.programName : ''
    }
  }

  toggle() {
    this.showDetails = !this.showDetails;
  }

  segmentChanged(event) {
    this.segmentType = event.detail.value;
  }

  openResource(resource) {
    this.projectService.openResources(resource);
  }

  doAction() {
    if (this.type == 'improvement' && !this.project.hasAcceptedTAndC && !this.isTargeted) {
      this.popupService.showPPPForProjectPopUp('FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY', 'FRMELEMNTS_LBL_PROJECT_PRIVACY_POLICY_TC', 'FRMELEMNTS_LBL_TCANDCP', 'FRMELEMNTS_LBL_SHARE_PROJECT_DETAILS', 'https://diksha.gov.in/term-of-use.html', 'privacyPolicy').then((data: any) => {
        if (data && data.isClicked) {
          this.project.hasAcceptedTAndC = data.isChecked;
          this.start();
        }
      })
    } else {
      this.start();
    }
  }

  gotoDetails() {
    this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
      replaceUrl: true,
      queryParams: {
        projectId: this.project._id,
        programId: this.project.programId,
        solutionId: this.project.solutionId
      },
    });
  }

  async start() {
    if (this.stateData?.referenceFrom === 'link') {
      this.startProjectsFromLink();
    } else if (this.project.projectId) {
      this.router.navigate([`${RouterLinks.PROJECT}/${RouterLinks.DETAILS}`], {
        queryParams: {
          projectId: this.project.projectId,
          programId: this.programId,
          solutionId: this.solutionId,
        },
      });
    } else {
      const payload = {
        projectId: this.project.projectId,
        programId: this.project.programId,
        solutionId: this.project.solutionId,
        isProfileInfoRequired: true,
        hasAcceptedTAndC: this.project.hasAcceptedTAndC,
        detailsPayload: this.stateData ? this.stateData : null,
        templateId: this.templateId
      }
      this.projectService.getProjectDetails(payload);
    }
  }

  startProjectsFromLink() {
    if (this.isATargetedSolution) {
      this.router
        .navigate([`/${RouterLinks.PROJECT}`], {
          queryParams: {
            selectedFilter: 'assignedToMe',
          },
        }).then(() => {
          const payload = {
            projectId: this.project.projectId,
            programId: this.project.programId,
            solutionId: this.project.solutionId,
            isProfileInfoRequired: true,
            hasAcceptedTAndC: this.project.hasAcceptedTAndC,
            detailsPayload: this.stateData ? this.stateData : null,
            templateId: this.templateId,
            replaceUrl: false
          }
          this.projectService.getProjectDetails(payload);
        })
    } else {
      const payload = {
        templateId: this.project._id,
        programId: this.programId,
        solutionId: this.solutionId,
        isATargetedSolution: false
      }
      this.projectService.mapProjectToUser(payload);
    }
  }

}